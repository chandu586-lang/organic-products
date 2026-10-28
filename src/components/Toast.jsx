import React from 'react';
import { useCart } from '../context/CartContext';
import './Toast.css';

/**
 * Toast Notification Popup
 */
function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="toast-popup">
      <span>{toastMessage}</span>
    </div>
  );
}

export default Toast;
