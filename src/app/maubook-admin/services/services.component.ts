import { Component, OnInit } from '@angular/core';
import { FirestoreService } from './firestore.service'; // Custom service to interact with Firebase Firestore

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  services: any[] = [];
  newService: string = '';
  isEditing: boolean = false;
  selectedServiceId: string = '';

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices() {
    // Fetch services from Firestore
    this.firestoreService.getServices().subscribe((data) => {
      this.services = data;
    });
  }

  addService() {
    if (this.newService.trim()) {
      this.firestoreService.addService({ name: this.newService }).then(() => {
        this.newService = ''; // Clear input
        this.loadServices();  // Reload services
      });
    }
  }

  editService(serviceId: string) {
    this.selectedServiceId = serviceId;
    const selectedService = this.services.find(service => service.id === serviceId);
    if (selectedService) {
      this.newService = selectedService.name;
      this.isEditing = true;
    }
  }

  saveEditedService() {
    if (this.newService.trim() && this.selectedServiceId) {
      this.firestoreService.updateService(this.selectedServiceId, { name: this.newService }).then(() => {
        this.newService = '';
        this.isEditing = false;
        this.loadServices();  // Reload services
      });
    }
  }

  cancelEdit() {
    this.newService = '';
    this.isEditing = false;
  }

  deleteService(serviceId: string) {
    this.firestoreService.deleteService(serviceId).then(() => {
      this.loadServices();  // Reload services after delete
    });
  }
}
