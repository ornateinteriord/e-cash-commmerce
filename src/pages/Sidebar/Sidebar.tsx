import './sidebar.scss';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserSideBarMenuItems, AdminSideBarMenuItems, Admin01SideBarMenuItems, AgentSideBarMenuItems } from './SidebarUtils';
import { Avatar, Box, Toolbar, Typography } from '@mui/material';
import { SideBarMenuItemType } from '../../store/store';
import { ExpandMoreIcon, ExpandLessIcon } from '../Icons';
import { useGetMemberDetails } from '../../api/Memeber';
import { LoadingComponent } from '../../App';
import { toast } from 'react-toastify';
import TokenService from '../../api/token/tokenService';

const Sidebar = ({ isOpen, onClose, role }: { isOpen: boolean, onClose: () => void, role: string | null }) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>('Dashboard');
  const [closingItem, setClosingItem] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (closingItem) {
      const timer = setTimeout(() => {
        setClosingItem(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [closingItem]);

  const handleToggle = (itemName: string) => {
    if (expandedItem && expandedItem !== itemName) {
      setClosingItem(expandedItem);
    }
    setExpandedItem(prev => prev === itemName ? null : itemName);
  };

  const handleSelect = (itemName: string) => {
    setSelectedItem(itemName);
    // Close sidebar on mobile regardless of submenu state
    if (window.innerWidth <= 768) {
      onClose();
    }
  };
  const menuItems =
    role === "ADMIN_01" ? Admin01SideBarMenuItems :
      role === "ADMIN" ? AdminSideBarMenuItems :
        role === "AGENT" ? AgentSideBarMenuItems :
          UserSideBarMenuItems;
  const userId = TokenService.getUserId()
  const memberMutatation = useGetMemberDetails(userId!)
  const { data: fethedUser, isLoading, isError, error } = memberMutatation
  const name = fethedUser?.Name || fethedUser?.username

  useEffect(() => {
    if (isError) {
      toast.error(error?.message || 'Failed to fetch user details')
    }
  }, [isError, error])



  const isNidhiRole = role === "ADMIN_01" || role === "AGENT" || role === "ADMIN";

  return (
    <motion.div
      className={`sidebar ${isOpen ? 'open' : 'closed'}`}
      initial={{ width: 0 }}
      animate={{ width: isOpen ? 250 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{
        zIndex: 100,
        background: isNidhiRole ? '#1F333B' : undefined,
        boxShadow: isOpen && isNidhiRole ? '4px 0 20px rgba(31, 51, 59, 0.4)' : 'none',
        overflow: 'hidden',
        borderRight: isNidhiRole ? '1px solid rgba(254, 128, 1, 0.2)' : 'none'
      }}
    >
      <Toolbar className="navbar-toolbar" />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-header"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: isNidhiRole ? '10px 20px 0px 20px' : undefined,
              flexDirection: isNidhiRole ? undefined : 'column',
              alignItems: isNidhiRole ? undefined : 'flex-start',
              gap: '5px'
            }}
          >
            {/* E-shopy Brand Logo at Top of Sidebar */}
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                pb: 1.5,
                mb: 1,
                borderBottom: isNidhiRole ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #FED7AA'
              }}
            >
              {isNidhiRole ? (
                <Box sx={{
                  bgcolor: '#FFFFFF',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}>
                  <Box
                    component="img"
                    src="/e-shopy.jpeg"
                    alt="E-shopy Logo"
                    onClick={() => {
                      navigate('/admin/dashboard');
                      if (window.innerWidth <= 768) onClose();
                    }}
                    sx={{
                      height: 32,
                      objectFit: 'contain',
                      cursor: 'pointer',
                      display: 'block',
                      mixBlendMode: 'multiply'
                    }}
                  />
                </Box>
              ) : (
                <Box
                  component="img"
                  src="/e-shopy.jpeg"
                  alt="E-shopy Logo"
                  onClick={() => {
                    navigate(role === "USER" ? '/user/dashboard' : '/admin/dashboard');
                    if (window.innerWidth <= 768) onClose();
                  }}
                  sx={{
                    height: 38,
                    objectFit: 'contain',
                    cursor: 'pointer',
                    display: 'block',
                    mixBlendMode: 'multiply'
                  }}
                />
              )}
            </Box>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Avatar
                alt="User Avatar"
                src={fethedUser?.profile_image || ''}
                sx={isNidhiRole ? {
                  width: 44,
                  height: 44,
                  background: 'linear-gradient(135deg, #FE8001 0%, #FF9933 100%)',
                  boxShadow: '0 4px 12px rgba(254, 128, 1, 0.3)',
                  border: '2px solid rgba(254, 128, 1, 0.5)',
                } : { width: 50, height: 50, bgcolor: '#FE8001', color: '#FFFFFF' }}
              >
                {!fethedUser?.profileImage && name?.charAt(0).toUpperCase()}
              </Avatar>
              <div className="welcome-text" style={{ padding: '0 10px', color: isNidhiRole ? '#FFFFFF' : undefined }}>
                <Typography style={isNidhiRole ? {
                  fontWeight: 'bold',
                  color: '#FE8001',
                  fontSize: '0.9rem',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  lineHeight: '1.2',
                } : {}}>Welcome,</Typography>
                <Typography style={isNidhiRole ? {
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '0.75rem',
                  fontWeight: '400',
                  marginTop: '0px',
                } : { fontWeight: 'bold' }}>
                  {fethedUser?.Name || name}
                  {isNidhiRole && <><br />ID: {fethedUser?.member_code || fethedUser?.Member_id || fethedUser?.member_id || fethedUser?.username || ''}</>}
                </Typography>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{
        height: 'calc(100vh - 100px)',
        overflowY: 'auto',
        paddingTop: isNidhiRole ? '0px' : undefined,
        paddingLeft: isNidhiRole ? '10px' : undefined,
        paddingRight: isNidhiRole ? '10px' : undefined,
        paddingBottom: '80px'
      }}>

        <AnimatePresence>
          {menuItems.filter((item: SideBarMenuItemType) => {
            if (role === "USER" && item.name === "Add-On Packages" && fethedUser?.upgrade_status !== 'Active') {
              return false;
            }
            return true;
          }).map((item: SideBarMenuItemType) => {
            const isSelected = selectedItem === item.name;
            const backgroundColor = isSelected && isNidhiRole
              ? 'rgba(254, 128, 1, 0.15)'
              : 'transparent';

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  onClick={() => {
                    if (item.isExpandable) {
                      handleToggle(item.name);
                    } else {
                      navigate(item.path!);
                      handleSelect(item.name);
                    }
                  }}
                  className={`menu-item ${isSelected ? 'selected' : ''}`}
                  style={isNidhiRole ? {
                    background: backgroundColor,
                    borderRadius: '12px',
                    marginBottom: '4px',
                    border: isSelected
                      ? '1px solid rgba(254, 128, 1, 0.4)'
                      : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    backdropFilter: isSelected ? 'blur(10px)' : 'none',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '48px',
                  } : {}}
                >
                  <span style={isNidhiRole ? {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: isSelected ? '#FE8001' : 'rgba(255, 255, 255, 0.9)',
                    fontWeight: isSelected ? '700' : '500',
                    flex: 1,
                  } : {}}>

                    {item.icon}
                    <span style={isNidhiRole ? { flex: 1 } : {}}>{item.name}</span>
                  </span>

                  {item.isExpandable && (
                    <span
                      style={isNidhiRole ? {
                        marginLeft: 'auto',
                        color: 'rgba(255, 255, 255, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      } : { marginLeft: 'auto' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(item.name);
                      }}
                    >
                      {expandedItem === item.name ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </span>
                  )}
                </div>
                {item.isExpandable && (
                  <motion.div
                    className="sub-items"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: (expandedItem === item.name || closingItem === item.name) ? 'auto' : 0,
                      opacity: expandedItem === item.name ? 1 : 0
                    }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={isNidhiRole ? {
                      background: 'rgba(254, 128, 1, 0.05)',
                      borderRadius: '8px',
                      margin: '4px 0 4px 8px',
                      overflow: 'hidden',
                      border: '1px solid rgba(254, 128, 1, 0.15)',
                    } : {}}
                  >
                    <AnimatePresence>
                      {(expandedItem === item.name || closingItem === item.name) && item.subItems?.map(subItem => {
                        const isSubItemActive = location.pathname === subItem.path;
                        const subItemBackground = isSubItemActive && isNidhiRole
                          ? 'linear-gradient(135deg, rgba(254, 128, 1, 0.25) 0%, rgba(31, 51, 59, 0.6) 100%)'
                          : 'transparent';

                        return (
                          <motion.div
                            key={subItem.name}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Link
                              to={subItem.path ?? '#'}
                              className={`sub-item ${isSubItemActive ? 'selected' : ''}`}
                              onClick={() => {
                                handleSelect(item.name);
                              }}
                              style={isNidhiRole ? {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 12px',
                                color: isSubItemActive ? '#FE8001' : 'rgba(255, 255, 255, 0.8)',
                                background: subItemBackground,
                                borderRadius: '6px',
                                margin: '2px 8px',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                              } : {}}
                            >
                              <span
                                className="sub-item-icon"
                                style={isNidhiRole ? {
                                  color: isSubItemActive ? '#FE8001' : 'rgba(255, 255, 255, 0.7)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '20px',
                                } : {}}
                              >
                                {subItem.icon}
                              </span>
                              <span
                                className="sub-item-name"
                                style={isNidhiRole ? {
                                  fontWeight: isSubItemActive ? '600' : '500',
                                  fontSize: '0.875rem',
                                  color: isSubItemActive ? '#FE8001' : 'inherit',
                                  flex: 1,
                                } : {}}
                              >
                                {subItem.name}
                              </span>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {isLoading && <LoadingComponent />}
      </div>
    </motion.div>
  );
}

export default Sidebar;
