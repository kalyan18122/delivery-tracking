import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Delivery {
  id: string; customer: string; address: string; status: string;
  history: { status: string; time: string }[];
}

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private api = 'http://localhost:3000/api/deliveries';
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<Delivery[]>(this.api); }
  track(id: string) { return this.http.get<Delivery>(`${this.api}/${id}`); }
  create(customer: string, address: string) { return this.http.post<Delivery>(this.api, { customer, address }); }
  updateStatus(id: string, status: string) { return this.http.put<Delivery>(`${this.api}/${id}/status`, { status }); }
  remove(id: string) { return this.http.delete(`${this.api}/${id}`); }
}
