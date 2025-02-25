const express = require('express');
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only .jpeg, .jpg and .png format allowed!'));
    }
});

// Validation helpers
const validateHouseData = (data) => {
    const requiredFields = ['location', 'price', 'datePosted', 'type', 'purpose'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    if (isNaN(Number(data.price)) || Number(data.price) <= 0) {
        throw new Error('Invalid price value');
    }
    
    const date = new Date(data.datePosted);
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
    }

    // Validate amenities if present (optional field)
    if (data.amenities) {
        try {
            // If amenities is sent as a string (from form-data), parse it
            const amenitiesObj = typeof data.amenities === 'string' 
                ? JSON.parse(data.amenities) 
                : data.amenities;
                
            // Ensure it has the right structure
            if (amenitiesObj && typeof amenitiesObj === 'object') {
                // Good to go - structure will be validated by type checking
            }
        } catch (error) {
            throw new Error('Invalid amenities format');
        }
    }
};

const processPhotos = (files) => {
    if (!files || files.length < 2) {
        throw new Error('Minimum 2 photos required');
    }

    return files.map(file => ({
        data: file.buffer,
        contentType: file.mimetype,
        originalName: file.originalname,
        size: file.size,
        uploadDate: new Date(),
        hash: crypto.createHash('md5').update(file.buffer).digest('hex')
    }));
};

// Route handlers
router.post('/', auth, upload.array('photos', 5), async (req, res) => {
    try {
        validateHouseData(req.body);
        
        const user = await req.app.locals.users.findOne({ 
            _id: new ObjectId(req.user.userId) 
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const photos = processPhotos(req.files);
        
        const newHouse = {
            location: req.body.location,
            price: Number(req.body.price),
            datePosted: new Date(req.body.datePosted),
            type: req.body.type,
            purpose: req.body.purpose,
            photos,
            // Add amenities data
            amenities: req.body.amenities ? JSON.parse(req.body.amenities) : {
                internal: [],
                external: [],
                nearby: []
            },
            seller: {
                id: user._id,
                name: user.username,
                email: user.email,
                phone: user.phoneNumber
            },
            createdAt: new Date(),
            status: 'available'
        };

        const result = await req.app.locals.houses.insertOne(newHouse);
        
        // Return response without binary data
        const responseHouse = {
            ...newHouse,
            photos: photos.map(photo => ({
                hash: photo.hash,
                contentType: photo.contentType,
                originalName: photo.originalName,
                size: photo.size,
                uploadDate: photo.uploadDate
            }))
        };

        res.status(201).json({
            success: true,
            message: 'House added successfully',
            houseId: result.insertedId,
            house: responseHouse
        });

    } catch (error) {
        console.error('Add House Error:', error);
        res.status(error.status || 500).json({
            success: false,
            message: 'Failed to add house',
            error: error.message
        });
    }
});

router.get('/image/:houseId/:photoIndex', async (req, res) => {
    try {
        const house = await req.app.locals.houses.findOne({ 
            _id: new ObjectId(req.params.houseId) 
        });
        
        if (!house || !house.photos || !house.photos[req.params.photoIndex]) {
            return res.status(404).json({ 
                success: false,
                message: 'Image not found' 
            });
        }
        
        const photo = house.photos[req.params.photoIndex];
        const imageBuffer = photo.data.buffer || photo.data;
        
        // Set caching headers
        res.set({
            'Cache-Control': 'public, max-age=31557600', // 1 year
            'ETag': `"${photo.hash}"`,
            'Content-Type': photo.contentType
        });
        
        res.send(imageBuffer);
        
    } catch (error) {
        console.error('Image fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch image',
            error: error.message
        });
    }
});

router.get('/my-listings', auth, async (req, res) => {
    try {
        const { type, purpose, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        const filter = {
            'seller.id': new ObjectId(req.user.userId)
        };
        
        if (type) filter.type = type;
        if (purpose) filter.purpose = purpose;

        const [houses, total] = await Promise.all([
            req.app.locals.houses
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .toArray(),
            req.app.locals.houses.countDocuments(filter)
        ]);

        // Remove binary data from response
        const sanitizedHouses = houses.map(house => ({
            ...house,
            photos: house.photos.map(photo => ({
                hash: photo.hash,
                contentType: photo.contentType,
                originalName: photo.originalName,
                size: photo.size,
                uploadDate: photo.uploadDate
            }))
        }));

        res.json({
            success: true,
            houses: sanitizedHouses,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Fetch My Listings Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your listings',
            error: error.message
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const { 
            type, 
            purpose, 
            location, 
            minPrice, 
            maxPrice,
            amenity,
            page = 1,
            limit = 10
        } = req.query;
        
        const skip = (page - 1) * limit;
        const filter = {};
        
        if (type) filter.type = type;
        if (purpose) filter.purpose = purpose;
        if (location) filter.location = new RegExp(location, 'i');
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        
        // Filter by amenity (can be comma-separated list)
        if (amenity) {
            const amenities = amenity.split(',').map(a => a.trim());
            
            if (amenities.length > 0) {
                filter.$or = [
                    { 'amenities.internal': { $in: amenities } },
                    { 'amenities.external': { $in: amenities } },
                    { 'amenities.nearby': { $in: amenities } }
                ];
            }
        }

        const [houses, total] = await Promise.all([
            req.app.locals.houses
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .toArray(),
            req.app.locals.houses.countDocuments(filter)
        ]);

        // Remove binary data from response
        const sanitizedHouses = houses.map(house => ({
            ...house,
            photos: house.photos.map(photo => ({
                hash: photo.hash,
                contentType: photo.contentType,
                originalName: photo.originalName,
                size: photo.size,
                uploadDate: photo.uploadDate
            }))
        }));

        res.json({
            success: true,
            houses: sanitizedHouses,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch houses',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const house = await req.app.locals.houses.findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        
        if (!house) {
            return res.status(404).json({
                success: false,
                message: 'House not found'
            });
        }
        
        // Remove binary data from response
        const sanitizedHouse = {
            ...house,
            photos: house.photos.map(photo => ({
                hash: photo.hash,
                contentType: photo.contentType,
                originalName: photo.originalName,
                size: photo.size,
                uploadDate: photo.uploadDate
            }))
        };
        
        res.json({
            success: true,
            house: sanitizedHouse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch house',
            error: error.message
        });
    }
});

router.put('/:id', auth, upload.array('photos', 5), async (req, res) => {
    try {
        const house = await req.app.locals.houses.findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        
        if (!house) {
            return res.status(404).json({
                success: false,
                message: 'House not found'
            });
        }
        
        if (house.seller.id.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this listing'
            });
        }

        const updates = { ...req.body };
        delete updates._id; // Prevent _id modification
        
        if (updates.price) updates.price = Number(updates.price);
        if (updates.datePosted) updates.datePosted = new Date(updates.datePosted);
        updates.updatedAt = new Date();

        // Handle amenities updates if present
        if (req.body.amenities) {
            try {
                updates.amenities = JSON.parse(req.body.amenities);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid amenities format',
                    error: error.message
                });
            }
        }

        // Handle photo updates if present
        if (req.files?.length > 0) {
            const newPhotos = processPhotos(req.files);
            
            if (req.body.replaceAllPhotos === 'true') {
                updates.photos = newPhotos;
            } else {
                updates.photos = [...(house.photos || []), ...newPhotos];
            }
        }

        await req.app.locals.houses.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updates }
        );

        res.json({
            success: true,
            message: 'House updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update house',
            error: error.message
        });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const house = await req.app.locals.houses.findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        
        if (!house) {
            return res.status(404).json({
                success: false,
                message: 'House not found'
            });
        }
        
        if (house.seller.id.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this listing'
            });
        }

        await req.app.locals.houses.deleteOne({ 
            _id: new ObjectId(req.params.id) 
        });
        
        res.json({
            success: true,
            message: 'House deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete house',
            error: error.message
        });
    }
});


router.get('/image/:houseId/:photoIndex', async (req, res) => {
    try {
        const house = await req.app.locals.houses.findOne({ 
            _id: new ObjectId(req.params.houseId) 
        });
        
        if (!house || !house.photos || !house.photos[req.params.photoIndex]) {
            return res.status(404).json({ 
                success: false,
                message: 'Image not found' 
            });
        }
        
        const photo = house.photos[req.params.photoIndex];
        const imageBuffer = photo.data.buffer || photo.data;
        
        // Set caching headers
        res.set({
            'Cache-Control': 'public, max-age=31557600', // 1 year
            'ETag': `"${photo.hash}"`,
            'Content-Type': photo.contentType
        });
        
        res.send(imageBuffer);
        
    } catch (error) {
        console.error('Image fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch image',
            error: error.message
        });
    }
});

router.get('/my-listings', auth, async (req, res) => {
    try {
        const { type, purpose, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        const filter = {
            'seller.id': new ObjectId(req.user.userId)
        };
        
        if (type) filter.type = type;
        if (purpose) filter.purpose = purpose;

        const [houses, total] = await Promise.all([
            req.app.locals.houses
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .toArray(),
            req.app.locals.houses.countDocuments(filter)
        ]);

        // Remove binary data from response
        const sanitizedHouses = houses.map(house => ({
            ...house,
            photos: house.photos.map(photo => ({
                hash: photo.hash,
                contentType: photo.contentType,
                originalName: photo.originalName,
                size: photo.size,
                uploadDate: photo.uploadDate
            }))
        }));

        res.json({
            success: true,
            houses: sanitizedHouses,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Fetch My Listings Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your listings',
            error: error.message
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const { 
            type, 
            purpose, 
            location, 
            minPrice, 
            maxPrice,
            page = 1,
            limit = 10
        } = req.query;
        
        const skip = (page - 1) * limit;
        const filter = {};
        
        if (type) filter.type = type;
        if (purpose) filter.purpose = purpose;
        if (location) filter.location = new RegExp(location, 'i');
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const [houses, total] = await Promise.all([
            req.app.locals.houses
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .toArray(),
            req.app.locals.houses.countDocuments(filter)
        ]);

        // Remove binary data from response
        const sanitizedHouses = houses.map(house => ({
            ...house,
            photos: house.photos.map(photo => ({
                hash: photo.hash,
                contentType: photo.contentType,
                originalName: photo.originalName,
                size: photo.size,
                uploadDate: photo.uploadDate
            }))
        }));

        res.json({
            success: true,
            houses: sanitizedHouses,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch houses',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const house = await req.app.locals.houses.findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        
        if (!house) {
            return res.status(404).json({
                success: false,
                message: 'House not found'
            });
        }
        
        // Remove binary data from response
        const sanitizedHouse = {
            ...house,
            photos: house.photos.map(photo => ({
                hash: photo.hash,
                contentType: photo.contentType,
                originalName: photo.originalName,
                size: photo.size,
                uploadDate: photo.uploadDate
            }))
        };
        
        res.json({
            success: true,
            house: sanitizedHouse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch house',
            error: error.message
        });
    }
});



module.exports = router;
