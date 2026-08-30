import { Router } from 'express';
import {
  listRestaurants,
  searchRestaurants,
  getRestaurant,
  getRestaurantReviews,
  getDishSearch,
} from '../controllers/restaurant.controller';

const router = Router();

router.get('/', listRestaurants);
router.get('/search', searchRestaurants);
router.get('/dish-search', getDishSearch);
router.get('/:id/reviews', getRestaurantReviews);
router.get('/:id', getRestaurant);

export default router;