import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useAuth from '../../hooks/useAuth';
import { getProfileApi, updateProfileApi, uploadProfilePhotoApi, changePasswordApi, deleteAccountApi } from '../../api/user.api';
import { parseError } from '../../utils/errorParser.util';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ErrorMessage from '../../components/common/ErrorMessage';
import { ROUTES } from '../../constants/routes.constants';
import toast from 'react-hot-toast';
import styles from './ProfilePage.module.css';

const profileSchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Required'),
  email: yup.string().email('Invalid email').required('Required'),
});

const pwdSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(8, 'Min 8 characters').required('New password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('newPassword')], 'Passwords do not match').required('Required'),
});

const ProfilePage = () => {
  const { user, logout, updateUserInContext } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  const { register: regPwd, handleSubmit: submitPwd, formState: { errors: pwdErrors, isSubmitting: pwdSaving }, reset: resetPwd } = useForm({
    resolver: yupResolver(pwdSchema),
  });

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email });
  }, [user, reset]);

  const onProfileSave = async (data) => {
    try {
      const { data: res } = await updateProfileApi(data);
      updateUserInContext(res.user || res);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  const onPasswordSave = async (data) => {
    try {
      await changePasswordApi({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password updated');
      resetPwd();
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setPhotoError('Image must be under 5MB'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setPhotoError('Only JPG, PNG, WebP allowed'); return; }
    setPhotoError('');
    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);
    const fd = new FormData();
    fd.append('photo', file);
    try {
      const { data } = await uploadProfilePhotoApi(fd);
      updateUserInContext({ photo: data.url || data.photoUrl });
      toast.success('Photo updated');
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccountApi();
      await logout();
      navigate(ROUTES.LOGIN);
      toast.success('Account deleted');
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className="page-header">
        <h1 className="page-title">Profile & Settings</h1>
      </div>

      <div className={styles.sections}>
        {/* Profile Photo */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile Photo</h2>
          <div className={styles.photoRow}>
            <div className={styles.photoWrapper} onClick={() => fileRef.current?.click()}>
              {photoPreview || user?.photo ? (
                <img src={photoPreview || user?.photo} alt="Profile" className={styles.photoImg} />
              ) : (
                <Avatar name={user?.name} size="xl" />
              )}
              {uploadingPhoto && <div className={styles.photoLoading}>⏳</div>}
              <div className={styles.photoOverlay}>Edit</div>
            </div>
            <div>
              <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} loading={uploadingPhoto}>
                Change Photo
              </Button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
              {photoError && <ErrorMessage message={photoError} />}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Personal Information</h2>
          <form onSubmit={handleSubmit(onProfileSave)} className={styles.form} noValidate>
            <Input label="Full name" error={errors.name?.message} required {...register('name')} />
            <Input label="Email address" type="email" error={errors.email?.message} required {...register('email')} />
            <div className={styles.formActions}>
              <Button type="submit" loading={isSubmitting}>Save Changes</Button>
            </div>
          </form>
        </div>

        {/* Password */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Change Password</h2>
          <form onSubmit={submitPwd(onPasswordSave)} className={styles.form} noValidate>
            <Input label="Current password" type="password" error={pwdErrors.currentPassword?.message} required {...regPwd('currentPassword')} />
            <Input label="New password" type="password" error={pwdErrors.newPassword?.message} required {...regPwd('newPassword')} />
            <Input label="Confirm new password" type="password" error={pwdErrors.confirmPassword?.message} required {...regPwd('confirmPassword')} />
            <div className={styles.formActions}>
              <Button type="submit" loading={pwdSaving}>Update Password</Button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className={[styles.section, styles.dangerSection].join(' ')}>
          <h2 className={[styles.sectionTitle, styles.dangerTitle].join(' ')}>Danger Zone</h2>
          <p className={styles.dangerText}>Permanently delete your account and all associated data. This action cannot be undone.</p>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete Account</Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete account?"
        message="All your trips, itineraries, and data will be permanently deleted."
        confirmLabel="Delete My Account"
        loading={deleting}
        requireTyping="DELETE"
      />
    </div>
  );
};

export default ProfilePage;
