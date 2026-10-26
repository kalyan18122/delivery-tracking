import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Delivery, DeliveryService } from './delivery.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="wrap">
    <h1>Delivery Tracking</h1>

    <section class="card">
      <h2>Track a delivery</h2>
      <input [(ngModel)]="trackId" placeholder="Enter ID e.g. DLV1001" />
      <button (click)="track()">Track</button>
      <p class="err" *ngIf="error">{{ error }}</p>
      <div *ngIf="tracked">
        <b>{{ tracked.id }}</b> – {{ tracked.customer }} – <span class="badge">{{ tracked.status }}</span>
        <ul><li *ngFor="let h of tracked.history">{{ h.status }} · {{ h.time | date:'medium' }}</li></ul>
      </div>
    </section>

    <section class="card">
      <h2>New delivery</h2>
      <input [(ngModel)]="customer" placeholder="Customer name" />
      <input [(ngModel)]="address" placeholder="Address" />
      <button (click)="add()">Add</button>
    </section>

    <section class="card">
      <h2>All deliveries</h2>
      <p class="err" *ngIf="loadError">{{ loadError }}</p>
      <table>
        <tr><th>ID</th><th>Customer</th><th>Address</th><th>Status</th><th></th></tr>
        <tr *ngFor="let d of deliveries">
          <td>{{ d.id }}</td><td>{{ d.customer }}</td><td>{{ d.address }}</td>
          <td>
            <select [ngModel]="d.status" (ngModelChange)="setStatus(d, $event)">
              <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
            </select>
          </td>
          <td><button class="del" (click)="remove(d)">Delete</button></td>
        </tr>
      </table>
    </section>
  </div>`,
  styles: [`
    .wrap{max-width:860px;margin:24px auto;font-family:system-ui,sans-serif;padding:0 12px}
    .card{border:1px solid #ddd;border-radius:10px;padding:16px;margin-bottom:16px}
    input,select{padding:8px;margin:0 6px 6px 0}
    button{padding:8px 14px;cursor:pointer}
    .del{background:#c0392b;color:#fff;border:0;border-radius:4px}
    table{width:100%;border-collapse:collapse} th,td{text-align:left;padding:8px;border-bottom:1px solid #eee}
    .badge{background:#e8f0fe;padding:2px 8px;border-radius:10px}
    .err{color:#c0392b}
  `]
})
export class AppComponent implements OnInit {
  statuses = ['Order Placed', 'Packed', 'In Transit', 'Out for Delivery', 'Delivered'];
  deliveries: Delivery[] = [];
  tracked?: Delivery;
  trackId = ''; customer = ''; address = ''; error = ''; loadError = '';

  constructor(private svc: DeliveryService, private cdr: ChangeDetectorRef) {}
  ngOnInit() { this.load(); }

  load() {
    this.svc.getAll().subscribe({
      next: d => { this.deliveries = d; this.loadError = ''; this.cdr.detectChanges(); },
      error: () => { this.loadError = 'Cannot reach backend at http://localhost:3000 - is it running?'; this.cdr.detectChanges(); }
    });
  }

  track() {
    this.error = ''; this.tracked = undefined;
    this.svc.track(this.trackId.trim().toUpperCase()).subscribe({
      next: d => { this.tracked = d; this.cdr.detectChanges(); },
      error: () => { this.error = 'Delivery not found'; this.cdr.detectChanges(); }
    });
  }

  add() {
    if (!this.customer || !this.address) return;
    this.svc.create(this.customer, this.address).subscribe(() => {
      this.customer = this.address = ''; this.load();
    });
  }

  setStatus(d: Delivery, status: string) { this.svc.updateStatus(d.id, status).subscribe(() => this.load()); }
  remove(d: Delivery) { this.svc.remove(d.id).subscribe(() => this.load()); }
}
