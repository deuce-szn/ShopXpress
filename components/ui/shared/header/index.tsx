import Image from 'next/image'
import Link from 'next/link'
import { APP_NAME } from '@/lib/constants';
import Menu from './menu';


const Header = () => {
    return <header className='w-full border-b'>
        <div className="flex-between px-4 py-2">
            <Link href='/' className='flex-start'>
                <Image src="/images/ShopXpress.jpg" alt={`${APP_NAME} logo`} width={90} height={90} priority={true}/>
                <span className="hidden lg:block font-bold text-2xl ml-3">{APP_NAME}</span>
            </Link>
            <Menu />
        </div>
    </header>;
};
 
export default Header;