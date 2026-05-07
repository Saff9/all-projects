/**
 * Game API Services
 * All API calls for game functionality
 */

import api from './api';

/**
 * Authentication API
 */
export const authTelegram = async (initData) => {
  const response = await api.post('/auth/telegram', { initData });
  return response.data;
};

/**
 * User API
 */
export const getUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await api.get('/users/leaderboard');
  return response.data;
};

/**
 * Clicker API
 */
export const click = async (timestamp, energyCost = 1) => {
  const response = await api.post('/clicker/click', { timestamp, energyCost });
  return response.data;
};

export const collectPassive = async () => {
  const response = await api.post('/clicker/collect');
  return response.data;
};

export const getClickerStatus = async () => {
  const response = await api.get('/clicker/status');
  return response.data;
};

/**
 * Shop API
 */
export const getShopItems = async () => {
  const response = await api.get('/shop/items');
  return response.data;
};

export const buyItem = async (itemId) => {
  const response = await api.post('/shop/buy', { itemId });
  return response.data;
};

export const buyFirewall = async () => {
  const response = await api.post('/shop/firewall');
  return response.data;
};

export const buyVirus = async () => {
  const response = await api.post('/shop/virus');
  return response.data;
};

/**
 * PVP API
 */
export const scanTarget = async () => {
  const response = await api.post('/pvp/scan');
  return response.data;
};

export const hackTarget = async (targetId) => {
  const response = await api.post('/pvp/hack', { targetId });
  return response.data;
};

export const getPVPCooldown = async () => {
  const response = await api.get('/pvp/cooldown');
  return response.data;
};

export const getHackHistory = async () => {
  const response = await api.get('/pvp/history');
  return response.data;
};
