import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { User } from '../entities/User';
import { Category } from '../entities/Category';

export const createUser = async (req: Request, res: Response) => {

try {
     const {
      firstName,
      profileImage,
      lastName,
      phone,
      email,
      password,
      age,
      weight,
      goalWeight,
      fitnessLevel,
      yourGoal,
      categoryId,
    } = req.body;

        if (!firstName || !profileImage) {
      return res.status(400).json({ message: 'firstName and profileImage are required' });
    }

    const userRepo = AppDataSource.getRepository(User);

      const newUser = new User();
    newUser.firstName = firstName;
    newUser.profileImage = profileImage;
    if (lastName) newUser.lastName = lastName;
    if (phone) newUser.phone = phone;
    if (email) newUser.email = email;
    if (password) newUser.password = password;
    if (age) newUser.age = age;
    if (weight) newUser.weight = weight;
    if (goalWeight) newUser.goalWeight = goalWeight;
    if (fitnessLevel) newUser.fitnessLevel = fitnessLevel;
    if (yourGoal) newUser.yourGoal = yourGoal;

        if (categoryId) {
      const categoryRepo = AppDataSource.getRepository(Category);
      const category = await categoryRepo.findOneBy({ id: categoryId });
      if (!category) return res.status(404).json({ message: 'Category not found' });
      newUser.category = category;
    }

        const savedUser = await userRepo.save(newUser);
    return res.status(201).json(savedUser);

} catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
}



}


export const getUser = async (req: Request, res: Response) =>{
    try {
        const id= req.body;
            const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOneBy({ id: id });

    return res.status(200).json({
        message:"Success",data:user
    });

    } catch (error) {
        
    }
}