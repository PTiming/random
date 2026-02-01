import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, menuItems }) => {
  return (
    <div className="sidebar">
      <h3>Navigation</h3>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={activeTab === item.id ? 'active' : ''}
            onClick={() => setActiveTab(item.id)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
