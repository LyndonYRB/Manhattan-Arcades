import React from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import '../styles/TitleBar.css';

const TitleBar = ({
  isMobile,
  activeMobilePanel,
  onOpenLeftPanel,
  onOpenRightPanel,
  onClosePanels,
}) => {
  const handleLeftToggle = () => {
    if (activeMobilePanel === 'left') {
      onClosePanels();
      return;
    }
    onOpenLeftPanel();
  };

  const handleRightToggle = () => {
    if (activeMobilePanel === 'right') {
      onClosePanels();
      return;
    }
    onOpenRightPanel();
  };

  return (
    <div className="title-bar">
      {isMobile ? (
        <button
          type="button"
          className="title-bar-toggle title-bar-toggle-left"
          aria-label={activeMobilePanel === 'left' ? 'Close venue menu' : 'Open venue menu'}
          onClick={handleLeftToggle}
        >
          <MenuIcon fontSize="small" />
        </button>
      ) : null}
      <div className="title-bar-content">
        <h1>Manhattan Arcades</h1>
        <p>Discover arcade venues across Manhattan.</p>
      </div>
      {isMobile ? (
        <button
          type="button"
          className="title-bar-toggle title-bar-toggle-right"
          aria-label={activeMobilePanel === 'right' ? 'Close account panel' : 'Open account panel'}
          onClick={handleRightToggle}
        >
          <AccountCircleOutlinedIcon fontSize="small" />
        </button>
      ) : null}
    </div>
  );
};

export default TitleBar;
