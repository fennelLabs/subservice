module "gce-container" {
  source = "terraform-google-modules/container-vm/google"
  version = "~> 2.0" 

  container = {
    image = "ubuntu-os-cloud/ubuntu-2004-lts"
  }
}

resource "google_storage_bucket_object" "startup" {
  name   = "fennel-subservice-terraform-start.sh"
  bucket = "whiteflag-0-admin"
  source = "fennel-subservice-terraform-start.sh"
  content_type = "text/plain"
}

resource "google_compute_address" "fennel-subservice-ip" {
  name = "fennel-subservice-ip"
}

resource "google_compute_instance" "fennel-subservice" {
  name         = "fennel-subservice-instance"
  machine_type = "e2-small"
  zone         = "us-east1-b"
  allow_stopping_for_update = true 

  can_ip_forward = true
  tags = ["private-server"]
  
  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network    = "whiteflag-sandbox-vpc"
    subnetwork = "private-subnet"
    access_config {
      nat_ip = google_compute_address.fennel-subservice-ip.address
    }
  } 

 metadata = {
    startup-script-url = "gs://whiteflag-0-admin/fennel-subservice-terraform-start.sh"
    gce-container-declaration = module.gce-container.metadata_value
    google-logging-enabled    = "true"
    google-monitoring-enabled = "true"
  }
 
  service_account {
    scopes = ["cloud-platform"]
  }
}

resource "google_storage_bucket_object" "fennel-subservice-ip" {
  name   = "fennel-subservice-ip.sh"
  bucket = "whiteflag-0-admin"
  content = google_compute_address.fennel-subservice-ip.address
}
