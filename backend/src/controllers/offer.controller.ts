import { Request, Response, NextFunction } from 'express';
import { OfferService } from '../services/offer.service';
import { createOfferSchema, updateOfferSchema, validateOfferSchema } from '../validators/offer.validator';
import { z } from 'zod';

const offerService = new OfferService();

export class OfferController {
  async getOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const offers = await offerService.getOffers(req.query);
      res.json(offers);
    } catch (error) {
      next(error);
    }
  }

  async getOfferById(req: Request, res: Response, next: NextFunction) {
    try {
      const offer = await offerService.getOfferById(Number(req.params.id));
      res.json(offer);
    } catch (error) {
      next(error);
    }
  }

  async createOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createOfferSchema.parse(req.body);
      const offer = await offerService.createOffer(data);
      res.status(201).json(offer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      next(error);
    }
  }

  async updateOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateOfferSchema.parse(req.body);
      const offer = await offerService.updateOffer(Number(req.params.id), data);
      res.json(offer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      next(error);
    }
  }

  async deleteOffer(req: Request, res: Response, next: NextFunction) {
    try {
      await offerService.deleteOffer(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async validateOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const data = validateOfferSchema.parse(req.body);
      const result = await offerService.validateAndCalculateDiscount(data.offerId, data.cartTotal, data.items);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      next(error);
    }
  }
}
