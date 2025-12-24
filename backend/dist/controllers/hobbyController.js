"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTravel = exports.updateTravel = exports.createTravel = exports.getTravelList = exports.deleteMovie = exports.updateMovie = exports.createMovie = exports.getMovieList = exports.deleteMusic = exports.updateMusic = exports.createMusic = exports.getMusicList = void 0;
const index_1 = require("../index");
// --- Music Controllers ---
const getMusicList = async (req, res) => {
    try {
        const music = await index_1.prisma.music.findMany({
            orderBy: { orderIndex: 'asc' },
        });
        res.json(music);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch music' });
    }
};
exports.getMusicList = getMusicList;
const createMusic = async (req, res) => {
    try {
        const { title, artist, coverUrl, platform, url, lyrics, orderIndex } = req.body;
        const music = await index_1.prisma.music.create({
            data: { title, artist, coverUrl, platform, url, lyrics, orderIndex: orderIndex || 0 },
        });
        res.status(201).json(music);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create music' });
    }
};
exports.createMusic = createMusic;
const updateMusic = async (req, res) => {
    try {
        const { id } = req.params;
        const music = await index_1.prisma.music.update({
            where: { id: parseInt(id) },
            data: req.body,
        });
        res.json(music);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update music' });
    }
};
exports.updateMusic = updateMusic;
const deleteMusic = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.music.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Music deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete music' });
    }
};
exports.deleteMusic = deleteMusic;
// --- Movie Controllers ---
const getMovieList = async (req, res) => {
    try {
        const movies = await index_1.prisma.movie.findMany({
            orderBy: { watchedAt: 'desc' },
        });
        res.json(movies);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
};
exports.getMovieList = getMovieList;
const createMovie = async (req, res) => {
    try {
        const { title, director, year, posterUrl, rating, review, watchedAt } = req.body;
        const movie = await index_1.prisma.movie.create({
            data: { title, director, year: year ? parseInt(year) : null, posterUrl, rating: rating ? parseFloat(rating) : null, review, watchedAt: watchedAt ? new Date(watchedAt) : null },
        });
        res.status(201).json(movie);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create movie' });
    }
};
exports.createMovie = createMovie;
const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        if (data.year)
            data.year = parseInt(data.year);
        if (data.rating)
            data.rating = parseFloat(data.rating);
        if (data.watchedAt)
            data.watchedAt = new Date(data.watchedAt);
        const movie = await index_1.prisma.movie.update({
            where: { id: parseInt(id) },
            data,
        });
        res.json(movie);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update movie' });
    }
};
exports.updateMovie = updateMovie;
const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.movie.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Movie deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete movie' });
    }
};
exports.deleteMovie = deleteMovie;
// --- Travel Controllers ---
const getTravelList = async (req, res) => {
    try {
        const travels = await index_1.prisma.travelFootprint.findMany({
            orderBy: { visitedAt: 'desc' },
        });
        res.json(travels);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch travel footprints' });
    }
};
exports.getTravelList = getTravelList;
const createTravel = async (req, res) => {
    try {
        const { location, latitude, longitude, visitedAt, description, photos } = req.body;
        const travel = await index_1.prisma.travelFootprint.create({
            data: {
                location,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                visitedAt: visitedAt ? new Date(visitedAt) : null,
                description,
                photos
            },
        });
        res.status(201).json(travel);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create travel footprint' });
    }
};
exports.createTravel = createTravel;
const updateTravel = async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        if (data.latitude)
            data.latitude = parseFloat(data.latitude);
        if (data.longitude)
            data.longitude = parseFloat(data.longitude);
        if (data.visitedAt)
            data.visitedAt = new Date(data.visitedAt);
        const travel = await index_1.prisma.travelFootprint.update({
            where: { id: parseInt(id) },
            data,
        });
        res.json(travel);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update travel footprint' });
    }
};
exports.updateTravel = updateTravel;
const deleteTravel = async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.travelFootprint.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Travel footprint deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete travel footprint' });
    }
};
exports.deleteTravel = deleteTravel;
//# sourceMappingURL=hobbyController.js.map