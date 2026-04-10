import NodeCache from 'node-cache';

// Initialize cache with 1 hour TTL (time-to-live) and 2 minute check period
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

export default cache;
