import mongoose from "mongoose";
const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter course title"],
        minLength: [6, 'Title must be atleast 6 characters'],
        maxLength: [80, "Title must be atmost 80 characters"]
    },
    description: {
        type: String,
        required: [true, "Please enter course description"],
        minLength: [20, "Description must be atleast 20 characters"]
    },
    lectures: [
        {
            title: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true
            },
            video: {  
                    public_id: {
                        type: String,
                        required: true,
                    },
                    url: {
                        type: String,
                        required: true
                    }
            }
        }
    ],
    poster: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true
        }
    },
    views: {
        type: Number,
        default: 0
    },
    numOfVideos: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: [true, "Enter course creator name"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})
export const courseSchema = mongoose.model('Course', CourseSchema);