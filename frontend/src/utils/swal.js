import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Custom mixin for toasts
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

/**
 * Show a sleek toast message
 * @param {string} icon - 'success' | 'error' | 'warning' | 'info'
 * @param {string} title - Message to show
 */
export const showToast = (icon, title) => {
    Toast.fire({ icon, title });
};

/**
 * Show a full alert popup
 * @param {string} icon - 'success' | 'error' | 'warning' | 'info'
 * @param {string} title - Main heading
 * @param {string} text - Description text
 */
export const showAlert = (icon, title, text) => {
    return Swal.fire({
        icon,
        title,
        text,
        confirmButtonColor: '#10b981', // primary color
        borderRadius: '1rem',
        customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-lg px-6 py-2'
        }
    });
};

/**
 * Show a confirmation dialog
 * @param {string} title - Question / Warning
 * @param {string} text - Details
 * @param {string} confirmText - Label for confirm button
 * @returns {Promise<boolean>}
 */
export const confirmAction = async (title, text, confirmText = 'Yes, Proceed') => {
    const result = await Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#ef4444',
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancel',
        borderRadius: '1rem',
        customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-lg px-6 py-2',
            cancelButton: 'rounded-lg px-6 py-2'
        }
    });
    return result.isConfirmed;
};

export default {
    showToast,
    showAlert,
    confirmAction
};
