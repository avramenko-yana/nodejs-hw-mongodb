import { Contact } from '../db/models/contact.js';
 
export const getAllContacts = async ({
  userId,
  page,
  perPage,
  sortBy,
  sortOrder,
  filter,
}) => {
  const skip = (page - 1) * perPage;
  const sort = { [sortBy]: sortOrder };
   
  const filterWithUserId = { ...filter, userId };

  const contactsQuery = Contact.find(filterWithUserId);
  const totalItems = await Contact.countDocuments(filterWithUserId);
  const totalPages = Math.ceil(totalItems / perPage);
  
  const data = await contactsQuery.sort(sort).skip(skip).limit(perPage);

  return { data, page, perPage, totalItems, totalPages, hasPreviousPage: page > 1, hasNextPage: page < totalPages };
};

export const getContactById = async (contactId, userId) => {
  return await Contact.findOne({ _id: contactId, userId });
};

export const createContact = async (payload, userId) => {
   
  return await Contact.create({ ...payload, userId });
};

export const updateContact = async (contactId, payload, userId) => {
  return await Contact.findOneAndUpdate({ _id: contactId, userId }, payload, { new: true });
};

export const deleteContact = async (contactId, userId) => {
  return await Contact.findOneAndDelete({ _id: contactId, userId });
};