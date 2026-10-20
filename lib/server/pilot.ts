import {getChatGPTUser} from '../../app/chatgpt-auth';
import {AppError,required} from './runtime';
export async function requirePilotUser(){const user=await getChatGPTUser();if(!user)throw new AppError('Connexion requise.',401);const owner=required('PILOT_OWNER_EMAIL').trim().toLowerCase();if(user.email.trim().toLowerCase()!==owner)throw new AppError('Ces opérations sont réservées au compte de la boutique pilote.',403);return user;}
