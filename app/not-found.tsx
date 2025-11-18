'use client';
import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6">
            <Image src='/images/ShopXpress.jpg' width={200} height={200} alt={`${APP_NAME} logo`} priority={true} />
            <div className="text-center space-y-4">
                <h1 className="text-6xl font-bold">404</h1>
                <h2 className="text-2xl font-semibold">Not Found</h2>
                <p className="text-destructive">Oops!Could not find requested page.</p>
                <Button variant ="outline" className='mt-4 ml-2' onClick={() => window.location.href=("/")}>
                    <Link href="/">Back To Home</Link>
                </Button>
            </div>
        </div>
    )
}
 
export default NotFoundPage;