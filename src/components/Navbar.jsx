// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // For setting offline status
import Button from './Button'; // Re-using our Button component
import styles from './Navbar.module.css'; // A new CSS module for Navbar

const Navbar = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (currentUser) {
        // Optional: Update user status to offline in Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { isOnline: false });
      }
      await auth.signOut();
      navigate('/auth'); // Redirect to auth page after logout
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out.");
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <Link to="/">Trackademic</Link>
      </div>
      <ul className={styles.navList}>
        {currentUser ? (
          <>
            {userRole === 'student' && (
              <li><Link to="/student-dashboard" className={styles.navLink}>My Dashboard</Link></li>
            )}
            {userRole === 'staff' && (
              <li><Link to="/staff-dashboard" className={styles.navLink}>Staff Dashboard</Link></li>
            )}
            <li>
              <Button onClick={handleLogout} variant="secondary">Logout</Button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/auth" className={styles.navLink}>Login / Signup</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;