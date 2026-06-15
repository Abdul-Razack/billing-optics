import { db } from '../config/db';
import { offers } from '../db/schema';
import { eq, sql, and, desc, asc } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../utils/errors';

export class OfferService {
  async getOffers(params: any = {}) {
    const { status, search } = params;
    
    let conditions = [];
    if (status === 'ACTIVE') conditions.push(eq(offers.isActive, true));
    else if (status === 'INACTIVE') conditions.push(eq(offers.isActive, false));

    if (search) {
      conditions.push(sql`${offers.name} ILIKE ${`%${search}%`} OR ${offers.code} ILIKE ${`%${search}%`}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await db.query.offers.findMany({
      where: whereClause,
      orderBy: [desc(offers.createdAt)],
    });
  }

  async getOfferById(id: number) {
    const [offer] = await db.select().from(offers).where(eq(offers.id, id));
    if (!offer) throw new NotFoundError(`Offer ${id} not found`);
    return offer;
  }

  async createOffer(data: any) {
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const [offer] = await db.insert(offers).values(data).returning();
    return offer;
  }

  async updateOffer(id: number, data: any) {
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const [updated] = await db.update(offers)
      .set(data)
      .where(eq(offers.id, id))
      .returning();
      
    if (!updated) throw new NotFoundError(`Offer ${id} not found`);
    return updated;
  }

  async deleteOffer(id: number) {
    const [deleted] = await db.delete(offers).where(eq(offers.id, id)).returning();
    if (!deleted) throw new NotFoundError(`Offer ${id} not found`);
    return deleted;
  }

  async validateAndCalculateDiscount(offerId: number, cartTotal: number, items: any[] = []) {
    const offer = await this.getOfferById(offerId);

    if (!offer.isActive) {
      throw new ValidationError('This offer is no longer active.');
    }

    const now = new Date();
    if (offer.startDate && new Date(offer.startDate) > now) {
      throw new ValidationError('This offer has not started yet.');
    }
    if (offer.endDate && new Date(offer.endDate) < now) {
      throw new ValidationError('This offer has expired.');
    }

    if (cartTotal < offer.minOrderValue) {
      throw new ValidationError(`Minimum order value of ${(offer.minOrderValue / 100).toFixed(2)} is required for this offer.`);
    }

    // Filter items if offer is restricted to specific products or categories
    let eligibleSubtotal = cartTotal;
    
    if (offer.applicableProducts?.length || offer.applicableCategories?.length) {
      eligibleSubtotal = 0;
      for (const item of items) {
        let isEligible = false;
        
        if (offer.applicableProducts?.length && offer.applicableProducts.includes(item.productId)) {
          isEligible = true;
        } else if (offer.applicableCategories?.length && item.categoryId && offer.applicableCategories.includes(item.categoryId)) {
          isEligible = true;
        }

        if (isEligible) {
          eligibleSubtotal += (item.price * item.quantity);
        }
      }
      
      if (eligibleSubtotal === 0) {
        throw new ValidationError('This offer does not apply to any items in your cart.');
      }
    }

    let discountTotal = 0;
    if (offer.type === 'PERCENTAGE') {
      if (offer.value > 100) throw new ValidationError('Invalid percentage value');
      discountTotal = Math.round((eligibleSubtotal * offer.value) / 100);
    } else if (offer.type === 'FLAT_AMOUNT') {
      discountTotal = offer.value;
    }

    // Ensure discount isn't more than the cart total
    if (discountTotal > cartTotal) {
      discountTotal = cartTotal;
    }

    return { discountTotal, offer };
  }
}
