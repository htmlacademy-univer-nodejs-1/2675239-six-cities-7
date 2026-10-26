import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { UserModel, type UserDocument, type UserEntity } from '../models/user.model.js';

export interface UserServiceInterface {
  findById(id: string): Promise<UserDocument | null>;
  findByEmail(email: string): Promise<UserDocument | null>;
  create(user: UserEntity): Promise<UserDocument>;
}

@injectable()
export class UserService implements UserServiceInterface {
  public async findById(id: string): Promise<UserDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return UserModel.findById(id).exec();
  }

  public async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).exec();
  }

  public async create(user: UserEntity): Promise<UserDocument> {
    return new UserModel(user).save();
  }
}
