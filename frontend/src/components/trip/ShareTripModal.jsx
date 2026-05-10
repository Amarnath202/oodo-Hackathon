import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import ConfirmDialog from '../common/ConfirmDialog';
import useShare from '../../hooks/useShare';
import { publishTripApi, unpublishTripApi } from '../../api/share.api';
import toast from 'react-hot-toast';
import { parseError } from '../../utils/errorParser.util';
import styles from './ShareTripModal.module.css';

const ShareTripModal = ({ isOpen, onClose, trip }) => {
  const [isPublished, setIsPublished] = useState(trip?.is_public || false);
  const [slug, setSlug] = useState(trip?.public_slug || '');
  const [publicUrl, setPublicUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirmUnpublish, setShowConfirmUnpublish] = useState(false);

  useEffect(() => {
    if (trip) {
      setIsPublished(trip.is_public);
      setSlug(trip.public_slug);
      if (trip.public_slug) {
        setPublicUrl(`${window.location.origin}/share/${trip.public_slug}`);
      }
    }
  }, [trip, isOpen]);

  const handlePublish = async () => {
    setLoading(true);
    try {
      const { data } = await publishTripApi(trip.id);
      setIsPublished(true);
      setSlug(data.public_slug || data.slug || data.data?.slug);
      setPublicUrl(data.share_url || data.publicUrl || data.data?.publicUrl || `${window.location.origin}/share/${data.public_slug}`);
      toast.success('Trip published! Share your link');
      
      // Update local trip object for immediate reflection without reload
      if (trip) {
        trip.is_public = true;
        trip.public_slug = data.public_slug || data.slug || data.data?.slug;
      }
    } catch (err) {
      toast.error('Failed to publish. Try again');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setLoading(true);
    try {
      await unpublishTripApi(trip.id);
      setIsPublished(false);
      setSlug('');
      setPublicUrl('');
      toast.success('Trip unpublished successfully');
      setShowConfirmUnpublish(false);
      
      if (trip) {
        trip.is_public = false;
        trip.public_slug = null;
      }
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={<span>📤 Share Your Trip</span>} maxWidth="500px">
      <div className={styles.content}>
        {!isPublished ? (
          <div className={styles.unpublishedState}>
            <div className={styles.illustration}>🌍</div>
            <p className={styles.text}>Your trip is private. Publish it to get a shareable link.</p>
            <Button 
              className={styles.publishBtn} 
              onClick={handlePublish} 
              disabled={loading}
            >
              {loading ? <><Spinner size="sm" /> Publishing...</> : 'Publish Trip'}
            </Button>
          </div>
        ) : (
          <div className={styles.publishedState}>
            <div className={styles.successBanner}>
              Your trip is live! 🎉
            </div>
            
            <div className={styles.urlBox}>
              <div className={styles.urlText}>
                <span className={styles.urlIcon}>🔗</span>
                <span className={styles.url}>{publicUrl}</span>
              </div>
              <Button 
                variant={copied ? 'primary' : 'outline'} 
                size="sm" 
                onClick={handleCopy}
                className={copied ? styles.copiedBtn : ''}
              >
                {copied ? 'Copied! ✓' : 'Copy'}
              </Button>
            </div>
            
            <p className={styles.note}>Anyone with this link can view your itinerary</p>
            
            <div className={styles.actions}>
              <Button 
                variant="outline" 
                className={styles.unpublishBtn} 
                onClick={() => setShowConfirmUnpublish(true)}
              >
                Unpublish Trip
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirmUnpublish}
        onClose={() => setShowConfirmUnpublish(false)}
        onConfirm={handleUnpublish}
        title="Unpublish Trip"
        message="This will remove public access. Anyone with the link cannot view it. Are you sure?"
        confirmText="Yes, unpublish"
        confirmVariant="danger"
        loading={loading}
      />
    </Modal>
  );
};

export default ShareTripModal;
