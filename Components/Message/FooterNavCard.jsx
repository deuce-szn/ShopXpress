
import { MdDelete } from "react-icons/md";
import { useCartStore } from "../CartStore";
import { useRouter } from "next/navigation";
import { IoIosSearch } from "react-icons/io";

const FooterNavCard = ({ mobileOpen, toggler = () => {} }) => {
  
  const { setSearchTerm, searchedProducts } = useCartStore();
  
    const handleSearch = (e) => {
      const term = e.target.value;
      setSearchTerm(term);
      searchedProducts(); // trigger the filtering based on the current search term
    };

    const router = useRouter();
        const navigate = (path) => {
          router.push(path);
        };

 
  return (
    <div >
      {mobileOpen && <div className="overlay" onClick={toggler}></div>}
      <div className={`message-container ${mobileOpen ? "active" : ""} bottom`}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div style={{fontSize:"2rem", cursor: "pointer", color:"red"}} onClick={toggler}>&times;</div>
        </div>

         <div className="search" onClick={()=>navigate("/search")} style={{marginBottom:"5rem"}}>
              <input
                type="text"
                placeholder="Search for your products"
                className="search-input"
                onChange={handleSearch}
              />
              <div className="search-icon">
                <IoIosSearch color="#000000" size={20} />
              </div>
            </div>




      </div>
    </div>
  );
};

export default FooterNavCard;
