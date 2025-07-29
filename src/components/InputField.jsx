// src/components/InputField.jsx
import React from 'react';
import styles from './InputField.module.css';

const InputField = ({ label, type = 'text', value, onChange, placeholder, error, ...props }) => {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.input}
        {...props}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default InputField;