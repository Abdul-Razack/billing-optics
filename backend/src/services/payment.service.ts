import { PaymentRepository } from '../repositories/payment.repository';

export class PaymentService {
  static async getPayments(params: any) {
    return await PaymentRepository.getPayments(params);
  }
}
