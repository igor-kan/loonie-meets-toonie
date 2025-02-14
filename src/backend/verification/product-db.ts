import { db } from '../db';
import { products, manufacturers } from '../schema';
import { eq, and, like } from 'drizzle-orm';

interface ProductVerification {
    isCanadian: boolean;
    confidence: number;
    details: {
        manufacturerLocation: string;
        contentPercentage: number;
        certifications: string[];
    };
}

export class ProductVerificationService {
    async verifyProduct(upc: string, name: string): Promise<ProductVerification> {
        // Check our database first
        const [existingProduct] = await db.select()
            .from(products)
            .where(eq(products.upc, upc))
            .limit(1);

        if (existingProduct) {
            return {
                isCanadian: existingProduct.isCanadian ?? false,
                confidence: 1.0, // Direct database match
                details: {
                    manufacturerLocation: existingProduct.manufacturerLocation ?? 'Unknown',
                    contentPercentage: Number(existingProduct.canadianContentPercentage) || 0,
                    certifications: existingProduct.certifications ?? []
                }
            };
        }

        // Check manufacturer database
        const manufacturer = await this.findManufacturer(name);
        if (manufacturer) {
            return {
                isCanadian: manufacturer.isCanadian ?? false,
                confidence: 0.8, // Manufacturer match
                details: {
                    manufacturerLocation: manufacturer.location,
                    contentPercentage: Number(manufacturer.avgCanadianContent) || 0,
                    certifications: manufacturer.certifications ?? []
                }
            };
        }

        // Fallback to heuristic verification
        return await this.heuristicVerification(name);
    }

    private async findManufacturer(productName: string) {
        const words = productName.split(' ');
        
        for (const word of words) {
            const [manufacturer] = await db.select()
                .from(manufacturers)
                .where(like(manufacturers.name, `%${word}%`))
                .limit(1);

            if (manufacturer) return manufacturer;
        }

        return null;
    }

    private async heuristicVerification(name: string): Promise<ProductVerification> {
        // Implement basic heuristics for Canadian products
        const canadianKeywords = ['Canada', 'Canadian', 'Made in Canada'];
        const hasCanadianKeyword = canadianKeywords.some(keyword => 
            name.toLowerCase().includes(keyword.toLowerCase())
        );

        return {
            isCanadian: hasCanadianKeyword,
            confidence: 0.3, // Low confidence for heuristic match
            details: {
                manufacturerLocation: 'Unknown',
                contentPercentage: hasCanadianKeyword ? 0.5 : 0,
                certifications: []
            }
        };
    }
} 