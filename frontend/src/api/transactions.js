// This file will store all the transaction information API calls

import {api} from "./client";

// post a new transaction (adjustment /purchase)
export async function createTransaction(payload) {
    const res = await api.post("/transactions", payload);
    return res.data;
}

// get transactions
export async function getAllTransactions(params) {
    const res = await api.get("/transactions", {params});
    // returns {count: , results []}
    return res.data;
}

// get transactions/:id

export async function getTransactionById(transactionId) {
    const res = await api.get("/transactions/" + transactionId);
    return res.data;
}

// change suspicious status
export async function toggleTransactionSuspicious(payload, transactionId) {
    const res = await api.patch(`/transactions/${transactionId}/suspicious`, payload);
    return res.data;
}

// create a new transfer transaction between 2 users

export async function createTransferTransaction(payload, userId) {
    // payload = amount, type
    // userId is id of the user we are sending to
    const res = await api.post(`/users/${userId}/transactions`, payload);
    return res.data;
}

export async function createRedemptionTransaction(payload) {
    const res = await api.post(`/users/me/transactions`, payload);
    return res.data;
}

export async function getUserTransactions(params = {}) {
    const res = await api.get(`/users/me/transactions`, {params});
    return res.data;
}

export async function processRedemptionTransaction(payload, transactionId) {
    const res = await api.patch(`/transactions/${transactionId}/processed`, payload);
    return res.data;

}






