import { useEffect } from "react";
import { useLoading } from "../../context/LoadingProvider";

const CharacterModel = () => {
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(100);
  }, [setLoading]);

  return (
    <div className="character-container">
      <div className="character-model">
        <img
          className="avatar-image"
          src="/images/avatar.webp"
          alt="3D illustrated portrait of Manoj"
          onLoad={() => setLoading(100)}
        />
      </div>
    </div>
  );
};

export default CharacterModel;
