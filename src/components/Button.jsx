// src/components/Button.jsx
import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false }) => {
  const buttonClassName = `${styles.button} ${styles[variant]} ${disabled ? styles.disabled : ''}`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClassName}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;