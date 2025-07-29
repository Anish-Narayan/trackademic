// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={styles.notFoundContainer}>
      <h1 className={styles.statusCode}>404</h1>
      <h2 className={styles.message}>Page Not Found</h2>
      <p className={styles.description}>
        The page you are looking for does not exist or an error occurred.
      </p>
      <Link to="/" className={styles.homeLink}>
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;