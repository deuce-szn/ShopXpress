import Swal from "sweetalert2";
export const AppName = "Hydot School System";

export const Show = {
  Success: function(value) {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: value
    });
  },
  Attention: function(value) {
    Swal.fire({
      icon: 'info',
      title: 'Attention',
      text: value
    });
  },
  showLoading: function(value) {
    Swal.fire({
      title: 'Please wait..',
      backdrop: true,
      allowOutsideClick: false,
      text: value,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  },
  hideLoading: function() {
    Swal.close();
  },
  Alert: function(value) {
    Swal.fire({
      icon: 'success',
      text: value,
      timer: 1000,            // <-- Auto close after 5 seconds
      timerProgressBar: true, // <-- Show progress bar
      showConfirmButton: false // <-- Hide the "OK" button
    });
  },
  Error: function(value) {
    Swal.fire({
      icon: 'info',
      text: value,
      timer: 1000,            // <-- Auto close after 5 seconds
      timerProgressBar: true, // <-- Show progress bar
      showConfirmButton: false // <-- Hide the "OK" button
    });
  },

   Confirm: function(message,onConfirm, onDelete) {
      Swal.fire({
        title: 'Are you sure?',
        text: message+"?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed',
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.isConfirmed) {
          // If user selects 'Yes'
          onConfirm(); // Execute the passed callback function
        } else{
          onDelete(); // Execute the passed callback function
        } 
      });
    }



};





