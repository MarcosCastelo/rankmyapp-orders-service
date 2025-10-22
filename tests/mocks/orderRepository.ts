import { IOrderRepository } from '../../src/application/ports/repositories/IOrderRespository';
import { Order } from '../../src/domain/entities/Order';

export function createOrderRepositoryMock(opts?: { findById?: Order | null }) {
  const saveMock = jest.fn().mockResolvedValue(undefined);
  const findByIdMock = jest.fn().mockResolvedValue(opts?.findById ?? null);
  const repo: IOrderRepository = { save: saveMock, findById: findByIdMock };
  return { repo, saveMock, findByIdMock };
}