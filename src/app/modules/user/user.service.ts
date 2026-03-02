import { User } from "./user.model";
import { IUser } from "./user.interface";
import path from "path";
import bcrypt from "bcrypt";

/**
 * Create a new user
 * @param payload - The user data
 * @returns The created user (without password)
 */
export const createUserService = async (payload: IUser) => {
  // Check if user already exists by email
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

  if (!payload.password) {
  throw new Error("Password is required");
}
  // Hash the password
  const saltRounds = 10; // you can increase for more security (slower)
  const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

  // Create new user with hashed password
  const user = await User.create({
    ...payload,
    password: hashedPassword,
  });

  // Exclude password from response
  const userWithoutPassword = await User.findById(user._id).select("-password");
  return userWithoutPassword;
};


export const getAllUsers=async()=>{
    
    const data =await User.find();
    return data;
    
}

export const updateUserInfo=async(id:string, payload: Partial <IUser>)=>{
      const user =await User.findOne({_id:id});
      
      if(!user){
       throw new Error("User not found!")
      }else{
        const updateInfo =await User.findByIdAndUpdate(id,payload,{
            new:true,
            runValidators:true,
        }).select("-password");
        console.log("In servide");
        console.log(updateInfo);
      return updateInfo;  
      }

      
}

export const deleteSingleUser=async(id:string)=>{
     const user =await User.findOne({_id:id});
      
      if(!user){
       throw new Error("User not found!")
      }else{
        const deleteInfo=await User.findByIdAndDelete(id,{
            new:true,
            runValidators:true,

        })
        return deleteInfo;
      }
}


export const savePicture = async (file: Express.Multer.File) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  const filePath = path.join("uploads", file.filename);
  return {
    filename: file.filename,
    path: filePath,
    mimetype: file.mimetype,
    size: file.size,
  };
};
