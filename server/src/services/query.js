//este módulo es para permitir que cualquier endpoint pueda usar pagination
const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_LIMIT = 0; //Si no hay limite queremos devolver todos los datos y en mongo cuando al limite se le pone 0 se retornan todos los datos.

function getPagination(query) {
    const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER;
    const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;

    const skip = (page - 1) * limit;

    return {
        skip,
        limit
    }
}

module.exports = {
    getPagination,
};