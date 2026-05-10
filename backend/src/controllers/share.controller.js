'use strict';

const { v4: uuidv4 } = require('uuid');
const { Trip, Stop, City, Activity, Budget, Checklist, ChecklistItem, Note } = require('../models');
const { sendSuccess, sendError } = require('../utils/response.util');
const ErrorCodes = require('../utils/errorCodes.util');
const { generateUniqueSlug } = require('../services/share.service');
const { emitToTrip } = require('../services/socket.service');

/**
 * POST /api/v1/share/trips/:tripId/publish
 * Makes a trip public and assigns a unique shareable slug.
 */
const publishTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      where: { id: req.params.tripId, user_id: req.user.id, is_deleted: false },
    });

    if (!trip) {
      return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found with the provided ID');
    }

    let slug = trip.public_slug;
    if (!slug) {
      slug = await generateUniqueSlug(trip.name);
    }

    await trip.update({ is_public: true, public_slug: slug });

    emitToTrip(trip.id, 'trip:published', { public_slug: slug });

    const shareUrl = `${process.env.CLIENT_URL}/share/${slug}`;

    return sendSuccess(res, 200, 'Trip published successfully', {
      public_slug: slug,
      share_url: shareUrl,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/share/trips/:tripId/unpublish
 * Makes a trip private and removes its shareable slug.
 */
const unpublishTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      where: { id: req.params.tripId, user_id: req.user.id, is_deleted: false },
    });

    if (!trip) {
      return sendError(res, 404, 'Trip not found', ErrorCodes.NOT_FOUND, null, 'No trip found with the provided ID');
    }

    await trip.update({ is_public: false, public_slug: null });

    emitToTrip(trip.id, 'trip:unpublished', { tripId: trip.id });

    return sendSuccess(res, 200, 'Trip unpublished successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/share/itinerary/:slug
 * Public endpoint — returns a shared trip by its slug. No auth required.
 */
const getPublicItinerary = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      where: { public_slug: req.params.slug, is_public: true, is_deleted: false },
      include: [
        {
          model: Stop, as: 'stops',
          include: [
            { model: City, as: 'city' },
            {
              model: Activity, as: 'activities',
              through: { attributes: ['scheduled_time'] },
            },
          ],
          order: [['order_index', 'ASC']],
        },
        { model: Budget, as: 'budget', attributes: ['total_cost', 'budget_limit', 'is_over_budget'] },
      ],
      attributes: { exclude: ['user_id', 'is_deleted'] },
    });

    if (!trip) {
      return sendError(
        res, 404,
        'Itinerary not found',
        ErrorCodes.NOT_FOUND,
        null,
        'No public itinerary found with the provided link'
      );
    }

    return sendSuccess(res, 200, 'Public itinerary retrieved', { trip });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/share/itinerary/:slug/copy
 * Copies a public trip as a new trip for the authenticated user.
 */
const copyPublicItinerary = async (req, res, next) => {
  try {
    const originalTrip = await Trip.findOne({
      where: { public_slug: req.params.slug, is_public: true, is_deleted: false },
      include: [
        {
          model: Stop, as: 'stops',
          include: [
            {
              model: Activity, as: 'activities',
              through: { attributes: ['scheduled_time'] },
            },
          ],
        },
      ],
    });

    if (!originalTrip) {
      return sendError(res, 404, 'Itinerary not found', ErrorCodes.NOT_FOUND, null, 'Public itinerary not found');
    }

    // Create new trip for the user
    const newTrip = await Trip.create({
      id: uuidv4(),
      user_id: req.user.id,
      name: `Copy of ${originalTrip.name}`,
      description: originalTrip.description,
      start_date: originalTrip.start_date,
      end_date: originalTrip.end_date,
      is_public: false,
    });

    // Auto-create budget and checklist
    await Budget.create({ id: uuidv4(), trip_id: newTrip.id });
    await Checklist.create({ id: uuidv4(), trip_id: newTrip.id });

    // Copy all stops and their activities
    for (const stop of originalTrip.stops) {
      const newStop = await Stop.create({
        id: uuidv4(),
        trip_id: newTrip.id,
        city_id: stop.city_id,
        order_index: stop.order_index,
        start_date: stop.start_date,
        end_date: stop.end_date,
        notes: stop.notes,
      });

      // Copy stop activities
      for (const activity of stop.activities) {
        const { StopActivity } = require('../models');
        await StopActivity.create({
          id: uuidv4(),
          stop_id: newStop.id,
          activity_id: activity.id,
          scheduled_time: activity.stopActivities?.[0]?.scheduled_time || null,
        });
      }
    }

    return sendSuccess(res, 201, 'Itinerary copied to your trips successfully', {
      trip_id: newTrip.id,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { publishTrip, unpublishTrip, getPublicItinerary, copyPublicItinerary };
