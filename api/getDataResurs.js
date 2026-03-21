
export default function handler(req, res) {
    const targetList = process.env.BASE_URL_TODO;
    const targetData = process.env.BASE_URL_PERSONAL;

    res.status(200).json({ targetList, targetData });
}