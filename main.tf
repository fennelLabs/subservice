module "gce-container" {
  source = "terraform-google-modules/container-vm/google"
  version = "~> 2.0" 

  container = {
    image = "ubuntu-os-cloud/ubuntu-2004-lts"
  }
}

resource "google_compute_address" "fennel-subservice-ip" {
  name = "fennel-subservice-ip"
}

resource "google_compute_instance" "fennel-subservice" {
  name         = "fennel-subservice-instance"
  machine_type = "e2-small"
  zone         = "us-east1-b"

  #can_ip_forward = true
  tags = ["private-server"]
  
  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network    = "whiteflag-sandbox-vpc"
    subnetwork = "public-subnet"
     #access_config {
     #nat_ip = google_compute_address.fennel-subservice-ip.address
     #}
  }

  metadata_startup_script = <<EOF
    #!/bin/bash
    apt-get update
    apt-get install -y docker.io
    gcloud auth print-access-token | docker login -u oauth2accesstoken --password-stdin us-east1-docker.pkg.dev
    docker pull us-east1-docker.pkg.dev/whiteflag-0/fennel-docker-registry/fennel-subservice:latest
    docker run -dit -p 1234:1234 --name fennel-subservice us-east1-docker.pkg.dev/whiteflag-0/fennel-docker-registry/fennel-subservice:latest
  EOF  

 metadata = {
    # Required metadata key.
    gce-container-declaration = module.gce-container.metadata_value
    google-logging-enabled    = "true"
    google-monitoring-enabled = "true"
  }
 
  service_account {
    scopes = ["cloud-platform"]
  }
}
