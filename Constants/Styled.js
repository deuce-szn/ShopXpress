import styled from "styled-components";
import Image from "next/image";

export const ResponsiveImage = styled(Image)`
  width: 40vw;
  height: 70vh;
  border-top-left-radius: 4rem;
  border-bottom-right-radius: 4rem;
  border: 2px solid white;
  object-fit: cover;

  @media (max-width: 768px) {
    width: 100%;
    height: 80vh;
    border-top-left-radius: 2rem;
    border-bottom-right-radius: 2rem;
  }

  @media (max-width: 1024px) {
    width: 100%;
    height: 80vh;
    border-top-left-radius: 2rem;
    border-bottom-right-radius: 2rem;
    
  }




`;
export const MultiResponsiveImage = styled(Image)`
  width: 37vw;
  height:70vh;
  object-fit: fill; /* Ensures the whole image fits without cropping */
  
  @media (max-width: 768px) {
    width: 100%;
   
    background-color:white
  }

  @media (max-width: 1024px) {
    width: 100%;
  }
`;

export const CertImage = styled(Image)`
  width: 37vw;
  height: 81vh;
  border: 2px solid white;
  object-fit: fill;

  @media (max-width: 768px) {
    width: 100%;
    height: 80vh;

  }

  @media (max-width: 1024px) {
    width: 100%;
    height: 80vh;
    
  }




`;

export const NavImage = styled(Image)`
  width: 180px;
  height: 60px;
  

  




`;

export const PortfolioImage = styled(Image)`
  width: 400px;
  height:400px;
  object-fit: fill; /* Ensures the whole image fits without cropping */
  
  @media (max-width: 768px) {
    width: 100%;
    background-color:white
  }

  @media (max-width: 1024px) {
    width: 100%;
  }
`;