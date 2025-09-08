const menuButtons = (setMenuVisible, toggleTheme, isDarkMode, openAddModal) => [
    { id: '4', action: () => setMenuVisible(true), icon: 'bars' },
    { id: '1', icon: 'plus', action: () => openAddModal() },
    // { id: '3', Usuarios: 'Base de ciclos', screen: 'BaseCicloScreen' },
    // {
    //   id: '8',
    //   icon: 'user',
    //   screen: 'UserProfileScreen',
    //   title: 'Perfil de Usuario',
    // },
    // {
    //   id: '9',
    //   icon: 'group',
    //   screen: 'AdminUsersScreen',
    //   title: 'Usuarios Administradores',
    // },
    {
      id: '7',
      screen: null,
      icon: isDarkMode ? 'sun-o' : 'moon-o',
      action: () => toggleTheme(),
    },
  ];
  
  export default menuButtons;
  