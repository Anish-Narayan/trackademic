import { useState, useEffect } from 'react';

const mockUsers = {
  'student@cit.edu.in': { role: 'student', department: 'CSE', email: 'student@cit.edu.in', batch: '2022-2027' },
  'staff@cit.edu.in': { role: 'staff', department: 'CSE', email: 'staff@cit.edu.in' },
  'student2@cit.edu.in': { role: 'student', department: 'ECE', email: 'student2@cit.edu.in', batch: '2022-2027' },
  'staff2@cit.edu.in': { role: 'staff', department: 'ECE', email: 'staff2@cit.edu.in' }
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a session in local storage
    const storedUser = JSON.parse(localStorage.getItem('trackademicUser'));
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (email) => {
    const foundUser = mockUsers[email];
    if (foundUser) {
      localStorage.setItem('trackademicUser', JSON.stringify(foundUser));
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('trackademicUser');
    setUser(null);
  };

  return { user, login, logout, loading };
};