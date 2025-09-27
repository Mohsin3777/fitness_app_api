import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { User } from '../entities/User';
import { Category } from '../entities/Category';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/authMiddleware';
export const createUser = async (req: Request, res: Response) => {
  try {
    console.log("createUser")
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

    // Validate required fields
    if (!firstName || !profileImage || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'firstName, profileImage, email, and password are required' 
      });
    }

    const userRepo = AppDataSource.getRepository(User);

    // Check if user already exists
    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ // 409 Conflict is more appropriate
        success: false,
        message: 'User already exists.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User();
    newUser.firstName = firstName;
    newUser.profileImage = profileImage;
    newUser.email = email;
    newUser.password = hashedPassword;
    
    // Optional fields
    if (lastName) newUser.lastName = lastName;
    if (phone) newUser.phone = phone;
    if (age) newUser.age = age;
    if (weight) newUser.weight = weight;
    if (goalWeight) newUser.goalWeight = goalWeight;
    if (fitnessLevel) newUser.fitnessLevel = fitnessLevel;
    if (yourGoal) newUser.yourGoal = yourGoal;

    // Handle category
    if (categoryId) {
      const categoryRepo = AppDataSource.getRepository(Category);
      const category = await categoryRepo.findOneBy({ id: categoryId });
      if (!category) {
        return res.status(404).json({ 
          success: false,
          message: 'Category not found' 
        });
      }
      newUser.category = category;
    }

    // Save user
    const savedUser = await userRepo.save(newUser);
    
    // Return success response (exclude password from response)
    const { password: _, ...userWithoutPassword } = savedUser;
    
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Create User Error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};








/**
 * Log in an existing user
 */


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const userRepo = AppDataSource.getRepository(User);

    // Find user by email
    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

   // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
                lastName: user.lastName,

        email: user.email,
        phone:user.phone,
        profileImage:user.profileImage,
        profileSetup:user.profileSetup
        
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while logging in. Please try again later.',
    });
  }
};



export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.query; // ✅ take from params instead of body
console.log(req.query)
    const userId = Number(id);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["category"], // ✅ include relations if you want
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ remove password before sending
    const { password, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: "Success",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




export const updateUser = async (req: Request, res: Response) => {
  try {
const id = (req as AuthRequest).user!.id;
  console.log(req.body)
    // ✅ Validate id
    const userId = Number(id);

  
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const {
      firstName,
      lastName,
      phone,
      email,
      password,
      profileImage,
      age,
      weight,
      goalWeight,
      fitnessLevel,
      yourGoal,
      categoryId,
    } = req.body;

    const userRepo = AppDataSource.getRepository(User);
    const categoryRepo = AppDataSource.getRepository(Category);

    // Find user
    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["category"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Update only provided fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (profileImage) user.profileImage = profileImage;
    if (age) user.age = age;
    if (weight) user.weight = weight;
    if (goalWeight) user.goalWeight = goalWeight;
    if (fitnessLevel) user.fitnessLevel = fitnessLevel;
    if (yourGoal) user.yourGoal = yourGoal;

    user.profileSetup=true

    // if (password) {
    //   user.password = await bcrypt.hash(password, 10);
    // }

    if (categoryId) {
      const category = await categoryRepo.findOneBy({ id: categoryId });
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      user.category = category;
    }

    // Save updated user
    const updatedUser = await userRepo.save(user);
    const { password: _, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




//perform exersice
