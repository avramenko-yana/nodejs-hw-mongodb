import { Contact } from '../db/models/contact.js';
 
export const getAllContacts = async ({
  page,
  perPage,
  sortBy,
  sortOrder,
  filter,
}) => {
  const skip = (page - 1) * perPage;
  const sort = { [sortBy]: sortOrder };
 
  const contactsQuery = Contact.find(filter);
 
  const totalItems = await Contact.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / perPage);
 
  const data = await contactsQuery
    .sort(sort)
    .skip(skip)
    .limit(perPage);

  return {
    data,
    page,
    perPage,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

export const getContactById = async (contactId) => {
  return await Contact.findById(contactId);
};

export const createContact = async (payload) => {
  return await Contact.create(payload);
};

export const updateContact = async (contactId, payload) => {
  return await Contact.findOneAndUpdate({ _id: contactId }, payload, {
    new: true,
  });
};

export const deleteContact = async (contactId) => {
  return await Contact.findOneAndDelete({ _id: contactId });
};