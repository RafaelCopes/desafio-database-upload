import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const categoriesRepository = getRepository(Category);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Not enough balance.');
    }

    let transactionsCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!transactionsCategory) {
      transactionsCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(transactionsCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category: transactionsCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
