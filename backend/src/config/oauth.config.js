'use strict';

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { v4: uuidv4 } = require('uuid');
const { User } = require('../models');

/**
 * Configures and registers the Google OAuth 2.0 strategy with Passport.
 * Only registers if GOOGLE_CLIENT_ID is set in environment.
 * Called once at app startup.
 */
const configureGoogleOAuth = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('[OAuth] Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const googleId = profile.id;
          const name = profile.displayName;
          const photoUrl = profile.photos?.[0]?.value || null;

          if (!email) {
            return done(null, false, { message: 'No email found in Google profile' });
          }

          // Try to find user by google_id first, then by email
          let user = await User.findOne({ where: { google_id: googleId } });

          if (!user) {
            user = await User.findOne({ where: { email } });

            if (user) {
              // Link Google ID to existing account
              await user.update({ google_id: googleId, profile_photo: user.profile_photo || photoUrl });
            } else {
              // Create new user from Google profile
              user = await User.create({
                id: uuidv4(),
                name,
                email,
                google_id: googleId,
                profile_photo: photoUrl,
                password: null,
                role: 'user',
              });
            }
          }

          if (user.is_deleted) {
            return done(null, false, { message: 'This account has been deactivated' });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
};

module.exports = { configureGoogleOAuth, passport };
