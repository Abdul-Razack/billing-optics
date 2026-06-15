import { Router } from 'express';
import { OfferController } from '../controllers/offer.controller';

export function createOfferRoutes() {
  const router = Router();
  const controller = new OfferController();

  router.get('/', controller.getOffers);
  router.post('/validate', controller.validateOffer);
  router.get('/:id', controller.getOfferById);
  router.post('/', controller.createOffer);
  router.put('/:id', controller.updateOffer);
  router.delete('/:id', controller.deleteOffer);

  return router;
}
