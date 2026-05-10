import { useState } from 'react';
import Button from '../common/Button';
import ShareTripModal from './ShareTripModal';
import styles from './ShareButton.module.css';

const ShareButton = ({ trip }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant="secondary" 
        onClick={() => setIsOpen(true)}
        className={styles.shareButton}
      >
        <span className={styles.icon}>📤</span> Share
        {trip?.is_public && <span className={styles.publicDot} title="Trip is public"></span>}
      </Button>

      <ShareTripModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        trip={trip} 
      />
    </>
  );
};

export default ShareButton;
