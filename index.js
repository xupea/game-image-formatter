import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';


// 配置
const INPUT_FILE = 'games.json'; // JSON 文件名
const OUTPUT_DIR = './images'; // 图片保存目录
const IMAGE_BASE_URL = 'https://ss20242103.imgix.net'; // 基础 URL，替换为实际地址
const SQUARE_IMAGE_BASE_URL = 'https://sss20242103.imgix.net'; // 基础 URL，替换为实际地址

// 创建输出目录
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

// 读取 JSON 文件
const jsonData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

// 提取游戏 ID
const gameIds = new Set();
jsonData.groups.forEach(group => {
    if (group.games) {
        group.games.forEach(game => {
            if (game.id) {
                gameIds.add(game.id);
            }
        });
    }
});

console.log(`发现 ${gameIds.size} 个唯一游戏 ID`);

console.log(gameIds.size);


// 下载图片函数
async function downloadImage(url, filePath) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    const buffer = await response.buffer();
    fs.writeFileSync(filePath, buffer);
    console.log(`已下载: ${filePath}`);
}

// 批量下载图片
(async () => {
    for (const gameId of gameIds) {
        // 下载长方形 webp 图片
        const imageUrl = `${IMAGE_BASE_URL}/${gameId}_2.png?fm=webp`;
        const outputFilePath = path.join(OUTPUT_DIR, `${gameId}.webp`);

        try {
            await downloadImage(imageUrl, outputFilePath);
        } catch (error) {
            console.error(`下载失败: ${imageUrl}`, error.message);
        }

        // 下载长方形预览 webp 图片
        const previewImageUrl = `${IMAGE_BASE_URL}/${gameId}_2.png?dpr=2&fm=webp&q=50&w=114&w=146&blur=200&px=6&quality=15`;
        const previewOutputFilePath = path.join(OUTPUT_DIR, `${gameId}_thumbnail.webp`);

        try {
            await downloadImage(previewImageUrl, previewOutputFilePath);
        } catch (error) {
            console.error(`下载失败: ${previewImageUrl}`, error.message);
        }

        // 下载正方形预览 webp 图片
        const squareImageUrl = `${SQUARE_IMAGE_BASE_URL}/${gameId}_2.png?fm=webp`;
        const squareOutputFilePath = path.join(OUTPUT_DIR, `${gameId}_square.webp`);

        try {
            await downloadImage(squareImageUrl, squareOutputFilePath);
        } catch (error) {
            console.error(`下载失败: ${squareImageUrl}`, error.message);
        }
    }
    console.log('所有图片下载完成');
})();
