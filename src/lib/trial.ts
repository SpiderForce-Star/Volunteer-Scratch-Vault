/**
 * Web Checkout trial. Stripe Price intro offers in the Dashboard should
 * match this length; `subscription_data.trial_period_days` is the source of
 * truth on each Checkout session.
 *
 * Card + billing details are required up front (`payment_method_collection:
 * always`). No card, no trial.
 */
export const TRIAL_PERIOD_DAYS = 7;

export const TRIAL_LABEL = "7-day free trial";
export const TRIAL_CTA = "Start 7-day free trial";
export const TRIAL_LENGTH_COPY = "7-day free trial";
