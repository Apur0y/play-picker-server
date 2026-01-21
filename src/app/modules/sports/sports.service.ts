import { Sports, SportsDocument } from "./sports.model";


export const createSports = async (payload: any) => {
  const session = await Sports.startSession();
  session.startTransaction();
  const extractIframeSrc = (value: string): string => {
  // If iframe HTML is sent
  const match = value.match(/src="([^"]+)"/);
  if (match && match[1]) {
    return match[1];
  }

  // Otherwise assume it's already a clean link
  return value;
};


  try {
    // 🔹 sanitize src
    const cleanSrc = extractIframeSrc(payload.src);

    if (!cleanSrc) {
      throw new Error("Invalid video source");
    }

    const lastItem = await Sports
      .findOne()
      .sort({ order: -1 })
      .session(session);

    const nextOrder = lastItem ? lastItem.order + 1 : 1;

    const result = await Sports.create(
      [
        {
          ...payload,
          src: cleanSrc, 
          order: nextOrder,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return result[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


export const getAllSports = async () => {
  return await Sports.find().sort({ order: 1 });
};


export const getSingleSports = async (id: string) => {
  return await Sports.findById(id);
};

export const updateSports = async (
  id: string,
  payload: Partial<SportsDocument>
) => {
  return await Sports.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const deleteSports = async (id: string) => {
  return await Sports.findByIdAndDelete(id);
};

export const reorderSports = async (
  items: { id: string; order: number }[]
) => {
  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { order: item.order } },
    },
  }));

  return await Sports.bulkWrite(bulkOps);
};
