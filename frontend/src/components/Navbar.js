import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{ backgroundColor: '#f5f5f5', padding: '10px' }}>
      <ul style={{ listStyle: 'none', display: 'flex', gap: '1rem', margin: 0 }}>
        <li>
          <Link to="/tools/evaluation">Оценка строений</Link>
        </li>
        <li>
          <Link to="/contacts">Контакты</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;